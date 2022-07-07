import { Resolver, Query, Mutation, Args, ResolveField, Parent, Int } from "@nestjs/graphql";
import { CharacterService } from "./character.service";
import { Allow, Account } from "../../middlewares";
import * as gql from "../../app/gql";
import * as srv from "../srv";
import * as db from "../db";
import { UseGuards } from "@nestjs/common";

@Resolver(() => gql.Character)
export class CharacterResolver {
  constructor(private readonly characterService: CharacterService, private readonly fileService: srv.FileService) {}

  @Query(() => gql.Character)
  @UseGuards(Allow.Every)
  async character(@Args({ name: "characterId", type: () => String }) characterId: string) {
    return this.characterService.character(characterId);
  }
  @Query(() => [gql.Character])
  @UseGuards(Allow.Every)
  async characters(
    @Args({ name: "query", type: () => gql.JSON }) query: db.Query<db.Character.Doc>,
    @Args({ name: "skip", type: () => Int }) skip: number,
    @Args({ name: "limit", type: () => Int }) limit: number
  ) {
    return this.characterService.characters(query, skip, limit);
  }

  @Query(() => Int)
  @UseGuards(Allow.Every)
  async count(@Args({ name: "query", type: () => gql.JSON }) query: db.Query<db.Character.Doc>) {
    return this.characterService.count(query);
  }

  @Mutation(() => gql.Character)
  @UseGuards(Allow.Admin)
  async createCharacter(@Args("data") data: gql.CharacterInput) {
    return await this.characterService.createCharacter(data);
  }

  @Mutation(() => gql.Character)
  @UseGuards(Allow.Admin)
  async updateCharacter(
    @Args({ name: "characterId", type: () => String }) characterId: string,
    @Args("data") data: gql.CharacterInput
  ) {
    return await this.characterService.updateCharacter(characterId, data);
  }

  @Mutation(() => gql.Character)
  @UseGuards(Allow.Admin)
  async removeCharacter(@Args({ name: "characterId", type: () => String }) characterId: string) {
    return await this.characterService.removeCharacter(characterId);
  }

  @ResolveField()
  async file(@Parent() character: db.Character.Character) {
    return await this.fileService.load(character.file);
  }
}
