"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.fullName || ""} ${user.username || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });
    return dbUser;
  } catch (error) {
    console.log("Error syncing user", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const user = prisma.user.findUnique({
      where: {
        clerkId,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.log("Error getting user by clerk id");
    return null;
  }
}

export async function getDbUserId() {
  const {userId:clerkId} = await auth()
  if(!clerkId) return null

  const user = await getUserByClerkId(clerkId)
  if(!user) throw new Error("User not found")

    return user.id
}

export async function getRandomUsers(){
  try {
    const userId = await getDbUserId();

    if(!userId) return [];
    //get 3 users who we dont follow and its nto us

    const randomUsers = prisma.user.findMany({
      where:{
        AND:[
          {NOT: {id:userId}},
          {
            NOT:{
              followers:{
                some:{
                  followerId :userId
                }
              }
            }
          }
        ]
      },
      select:{
        id:true,
        name:true,
        username:true,
        image:true,
        _count:{
          select:{
            followers:true
          }
        }
      },
      take:3,
    })
    return randomUsers;
  } catch (error) {
    return []
  }
}

export async function toggleFollow(targetUserId:string){
  try {
    const userId = await getDbUserId()
        if(!userId) return;

    if(userId===targetUserId) throw new Error("You cant follow self")
    const existingFollow = await prisma.follow.create({
      where:{
        followerId_followingId:{
          followerId: userId,
          followingId: targetUserId,
        }
      }
    })
    if(existingFollow){
      await prisma.follows.delete({
        where:{
          followerId_followingId:{
          followerId: userId,
          followingId: targetUserId,
        }
        }
      })
    }else{
      await prisma.$transaction([
        prisma.follows.create({
          data:{followerId: userId,
          followingId: targetUserId,}
        }),
        prisma.notification.create({
          data:{
            userId: targetUserId,
            creatorId: userId,
            type: "FOLLOW"
          }
        })
      ])
    }
    revalidatePath('/')
  return{success:true}
  } catch (error) {
    return{success:false}
  }
}